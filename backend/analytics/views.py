from datetime import datetime, timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from diary.models import MealEntry
from .services import aggregate_nutrients, get_nutrient_expressions


class DailyAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_param = request.query_params.get('date')

        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'detail': 'Некорректный формат даты. Используй YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            target_date = timezone.localdate()

        entries = MealEntry.objects.filter(
            user=request.user,
            date=target_date,
        )

        totals = aggregate_nutrients(entries)

        return Response(
            {
                'date': target_date.isoformat(),
                'totals': totals,
            }
        )


class WeeklyAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_param = request.query_params.get('date')

        if date_param:
            try:
                end_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'detail': 'Некорректный формат даты. Используй YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            end_date = timezone.localdate()

        start_date = end_date - timedelta(days=6)

        expressions = get_nutrient_expressions()

        grouped_data = (
            MealEntry.objects.filter(
                user=request.user,
                date__range=(start_date, end_date),
            )
            .values('date')
            .annotate(
                calories=Sum(expressions['calories']),
                proteins=Sum(expressions['proteins']),
                fats=Sum(expressions['fats']),
                carbs=Sum(expressions['carbs']),
            )
            .order_by('date')
        )

        data_by_date = {
            item["date"].isoformat(): {
                "calories": float(item["calories"] or 0),
                "proteins": float(item["proteins"] or 0),
                "fats": float(item["fats"] or 0),
                "carbs": float(item["carbs"] or 0),
            }
            for item in grouped_data
        }

        days = []
        current_date = start_date

        while current_date <= end_date:
            date_key = current_date.isoformat()

            days.append(
                {
                    "date": date_key,
                    **data_by_date.get(
                        date_key,
                        {
                            "calories": 0,
                            "proteins": 0,
                            "fats": 0,
                            "carbs": 0,
                        },
                    ),
                }
            )
            current_date += timedelta(days=1)

        return Response(
            {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days,
            }
        )
