from decimal import Decimal

from django.db.models import DecimalField, ExpressionWrapper, F, Sum, Value


NUTRIENT_OUTPUT_FIELD = DecimalField(max_digits=12, decimal_places=2)

def nutrient_expression(product_field: str):
    return ExpressionWrapper(
        F(product_field) * F('weight_grams') / Value(Decimal('100')),
        output_field=NUTRIENT_OUTPUT_FIELD,
    )

def get_nutrient_expressions():
    return {
        'calories': nutrient_expression('product__calories_per_100g'),
        'proteins': nutrient_expression('product__proteins_per_100g'),
        'fats': nutrient_expression('product__fats_per_100g'),
        'carbs': nutrient_expression('product__carbs_per_100g'),
    }

def aggregate_nutrients(queryset):
    expressions = get_nutrient_expressions()

    totals = queryset.aggregate(
        calories=Sum(expressions["calories"]),
        proteins=Sum(expressions["proteins"]),
        fats=Sum(expressions["fats"]),
        carbs=Sum(expressions["carbs"]),
    )

    return {
        "calories": float(totals["calories"] or 0),
        "proteins": float(totals["proteins"] or 0),
        "fats": float(totals["fats"] or 0),
        "carbs": float(totals["carbs"] or 0),
    }
