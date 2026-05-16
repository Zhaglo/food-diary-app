from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from diary.models import MealEntry
from products.models import Product
from users.models import DailyGoals, User


class Command(BaseCommand):
    help = "Создает демонстрационные данные для Food Diary"

    def handle(self, *args, **options):
        self.stdout.write("Создаем демонстрационные данные...")

        admin = self.create_admin()
        demo_user = self.create_demo_user()

        self.create_goals(admin, demo_user)
        products = self.create_products(admin, demo_user)
        self.create_meal_entries(demo_user, products)

        self.stdout.write(
            self.style.SUCCESS("Демонстрационные данные успешно созданы.")
        )

    def create_admin(self):
        admin, created = User.objects.get_or_create(
            username="admin_demo",
            defaults={
                "email": "admin_demo@example.com",
                "is_staff": True,
                "is_superuser": True,
            },
        )

        if created:
            admin.set_password("AdminDemo123!")
            admin.save()
            self.stdout.write("Создан администратор: admin_demo / AdminDemo123!")
        else:
            self.stdout.write("Администратор admin_demo уже существует.")

        return admin

    def create_demo_user(self):
        demo_user, created = User.objects.get_or_create(
            username="demo_user",
            defaults={
                "email": "demo_user@example.com",
            },
        )

        if created:
            demo_user.set_password("DemoUser123!")
            demo_user.save()
            self.stdout.write("Создан пользователь: demo_user / DemoUser123!")
        else:
            self.stdout.write("Пользователь demo_user уже существует.")

        return demo_user

    def create_goals(self, admin, demo_user):
        DailyGoals.objects.get_or_create(
            user=admin,
            defaults={
                "calories": Decimal("2200.00"),
                "proteins": Decimal("120.00"),
                "fats": Decimal("75.00"),
                "carbs": Decimal("260.00"),
            },
        )

        DailyGoals.objects.get_or_create(
            user=demo_user,
            defaults={
                "calories": Decimal("2000.00"),
                "proteins": Decimal("110.00"),
                "fats": Decimal("70.00"),
                "carbs": Decimal("240.00"),
            },
        )

        self.stdout.write("Цели пользователей готовы.")

    def create_products(self, admin, demo_user):
        product_data = [
            {
                "name": "Овсянка",
                "calories_per_100g": Decimal("366.00"),
                "proteins_per_100g": Decimal("12.30"),
                "fats_per_100g": Decimal("6.10"),
                "carbs_per_100g": Decimal("59.50"),
                "created_by": admin,
            },
            {
                "name": "Куриная грудка",
                "calories_per_100g": Decimal("165.00"),
                "proteins_per_100g": Decimal("31.00"),
                "fats_per_100g": Decimal("3.60"),
                "carbs_per_100g": Decimal("0.00"),
                "created_by": admin,
            },
            {
                "name": "Рис вареный",
                "calories_per_100g": Decimal("130.00"),
                "proteins_per_100g": Decimal("2.70"),
                "fats_per_100g": Decimal("0.30"),
                "carbs_per_100g": Decimal("28.20"),
                "created_by": admin,
            },
            {
                "name": "Банан",
                "calories_per_100g": Decimal("89.00"),
                "proteins_per_100g": Decimal("1.10"),
                "fats_per_100g": Decimal("0.30"),
                "carbs_per_100g": Decimal("22.80"),
                "created_by": admin,
            },
            {
                "name": "Яйцо куриное",
                "calories_per_100g": Decimal("157.00"),
                "proteins_per_100g": Decimal("12.70"),
                "fats_per_100g": Decimal("10.90"),
                "carbs_per_100g": Decimal("0.70"),
                "created_by": admin,
            },
            {
                "name": "Творог 5%",
                "calories_per_100g": Decimal("121.00"),
                "proteins_per_100g": Decimal("17.20"),
                "fats_per_100g": Decimal("5.00"),
                "carbs_per_100g": Decimal("1.80"),
                "created_by": admin,
            },
            {
                "name": "Гречка вареная",
                "calories_per_100g": Decimal("110.00"),
                "proteins_per_100g": Decimal("4.20"),
                "fats_per_100g": Decimal("1.10"),
                "carbs_per_100g": Decimal("21.30"),
                "created_by": demo_user,
            },
            {
                "name": "Яблоко",
                "calories_per_100g": Decimal("52.00"),
                "proteins_per_100g": Decimal("0.30"),
                "fats_per_100g": Decimal("0.20"),
                "carbs_per_100g": Decimal("14.00"),
                "created_by": demo_user,
            },
            {
                "name": "Молоко 2.5%",
                "calories_per_100g": Decimal("52.00"),
                "proteins_per_100g": Decimal("2.80"),
                "fats_per_100g": Decimal("2.50"),
                "carbs_per_100g": Decimal("4.70"),
                "created_by": demo_user,
            },
            {
                "name": "Авокадо",
                "calories_per_100g": Decimal("160.00"),
                "proteins_per_100g": Decimal("2.00"),
                "fats_per_100g": Decimal("14.70"),
                "carbs_per_100g": Decimal("8.50"),
                "created_by": admin,
            },
        ]

        products = {}

        for item in product_data:
            product, _ = Product.objects.get_or_create(
                name=item["name"],
                defaults={
                    "calories_per_100g": item["calories_per_100g"],
                    "proteins_per_100g": item["proteins_per_100g"],
                    "fats_per_100g": item["fats_per_100g"],
                    "carbs_per_100g": item["carbs_per_100g"],
                    "created_by": item["created_by"],
                },
            )

            products[item["name"]] = product

        self.stdout.write("Каталог продуктов готов.")
        return products

    def create_meal_entries(self, demo_user, products):
        today = timezone.localdate()

        entries_data = [
            {
                "days_ago": 6,
                "meal_type": MealEntry.MealType.BREAKFAST,
                "product": "Овсянка",
                "weight_grams": Decimal("80.00"),
            },
            {
                "days_ago": 6,
                "meal_type": MealEntry.MealType.LUNCH,
                "product": "Куриная грудка",
                "weight_grams": Decimal("180.00"),
            },
            {
                "days_ago": 5,
                "meal_type": MealEntry.MealType.BREAKFAST,
                "product": "Яйцо куриное",
                "weight_grams": Decimal("120.00"),
            },
            {
                "days_ago": 5,
                "meal_type": MealEntry.MealType.SNACK,
                "product": "Банан",
                "weight_grams": Decimal("140.00"),
            },
            {
                "days_ago": 4,
                "meal_type": MealEntry.MealType.LUNCH,
                "product": "Рис вареный",
                "weight_grams": Decimal("200.00"),
            },
            {
                "days_ago": 4,
                "meal_type": MealEntry.MealType.DINNER,
                "product": "Куриная грудка",
                "weight_grams": Decimal("160.00"),
            },
            {
                "days_ago": 3,
                "meal_type": MealEntry.MealType.BREAKFAST,
                "product": "Творог 5%",
                "weight_grams": Decimal("180.00"),
            },
            {
                "days_ago": 3,
                "meal_type": MealEntry.MealType.SNACK,
                "product": "Яблоко",
                "weight_grams": Decimal("150.00"),
            },
            {
                "days_ago": 2,
                "meal_type": MealEntry.MealType.LUNCH,
                "product": "Гречка вареная",
                "weight_grams": Decimal("220.00"),
            },
            {
                "days_ago": 2,
                "meal_type": MealEntry.MealType.DINNER,
                "product": "Куриная грудка",
                "weight_grams": Decimal("170.00"),
            },
            {
                "days_ago": 1,
                "meal_type": MealEntry.MealType.BREAKFAST,
                "product": "Овсянка",
                "weight_grams": Decimal("90.00"),
            },
            {
                "days_ago": 1,
                "meal_type": MealEntry.MealType.SNACK,
                "product": "Банан",
                "weight_grams": Decimal("130.00"),
            },
            {
                "days_ago": 0,
                "meal_type": MealEntry.MealType.BREAKFAST,
                "product": "Яйцо куриное",
                "weight_grams": Decimal("100.00"),
            },
            {
                "days_ago": 0,
                "meal_type": MealEntry.MealType.LUNCH,
                "product": "Рис вареный",
                "weight_grams": Decimal("180.00"),
            },
            {
                "days_ago": 0,
                "meal_type": MealEntry.MealType.DINNER,
                "product": "Куриная грудка",
                "weight_grams": Decimal("150.00"),
            },
        ]

        created_count = 0

        for item in entries_data:
            entry_date = today - timedelta(days=item["days_ago"])
            product = products[item["product"]]

            _, created = MealEntry.objects.get_or_create(
                user=demo_user,
                product=product,
                meal_type=item["meal_type"],
                weight_grams=item["weight_grams"],
                date=entry_date,
            )

            if created:
                created_count += 1

        self.stdout.write(
            f"Записи дневника готовы. Новых создано: {created_count}."
        )