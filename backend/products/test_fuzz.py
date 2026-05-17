from decimal import Decimal

from hypothesis import given, settings, strategies as st
from hypothesis.extra.django import TestCase

from products.serializers import ProductSerializer


class ProductSerializerFuzzTests(TestCase):
    @settings(max_examples=50)
    @given(
        name=st.text(
            alphabet=st.characters(whitelist_categories=("Zs",)),
            min_size=1,
            max_size=30,
        )
    )
    def test_whitespace_only_product_name_is_rejected(self, name):
        serializer = ProductSerializer(
            data={
                "name": name,
                "calories_per_100g": "100.00",
                "proteins_per_100g": "10.00",
                "fats_per_100g": "5.00",
                "carbs_per_100g": "20.00",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    @settings(max_examples=50)
    @given(value=st.decimals(min_value=Decimal("-10000.00"), max_value=Decimal("-0.01"), places=2))
    def test_negative_calories_are_rejected(self, value):
        serializer = ProductSerializer(
            data={
                "name": "Тестовый продукт",
                "calories_per_100g": str(value),
                "proteins_per_100g": "10.00",
                "fats_per_100g": "5.00",
                "carbs_per_100g": "20.00",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("calories_per_100g", serializer.errors)

    @settings(max_examples=50)
    @given(value=st.decimals(min_value=Decimal("-10000.00"), max_value=Decimal("-0.01"), places=2))
    def test_negative_proteins_are_rejected(self, value):
        serializer = ProductSerializer(
            data={
                "name": "Тестовый продукт",
                "calories_per_100g": "100.00",
                "proteins_per_100g": str(value),
                "fats_per_100g": "5.00",
                "carbs_per_100g": "20.00",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("proteins_per_100g", serializer.errors)

    @settings(max_examples=50)
    @given(value=st.decimals(min_value=Decimal("-10000.00"), max_value=Decimal("-0.01"), places=2))
    def test_negative_fats_are_rejected(self, value):
        serializer = ProductSerializer(
            data={
                "name": "Тестовый продукт",
                "calories_per_100g": "100.00",
                "proteins_per_100g": "10.00",
                "fats_per_100g": str(value),
                "carbs_per_100g": "20.00",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("fats_per_100g", serializer.errors)

    @settings(max_examples=50)
    @given(value=st.decimals(min_value=Decimal("-10000.00"), max_value=Decimal("-0.01"), places=2))
    def test_negative_carbs_are_rejected(self, value):
        serializer = ProductSerializer(
            data={
                "name": "Тестовый продукт",
                "calories_per_100g": "100.00",
                "proteins_per_100g": "10.00",
                "fats_per_100g": "5.00",
                "carbs_per_100g": str(value),
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("carbs_per_100g", serializer.errors)
