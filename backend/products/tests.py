from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from products.models import Product


class ProductPermissionsTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner_user",
            password="OwnerPass123!",
        )

        self.other_user = User.objects.create_user(
            username="other_user",
            password="OtherPass123!",
        )

        self.admin = User.objects.create_superuser(
            username="admin_user",
            password="AdminPass123!",
            email="admin@example.com",
        )

        self.product = Product.objects.create(
            name="Тестовый продукт",
            calories_per_100g=Decimal("250.00"),
            proteins_per_100g=Decimal("10.00"),
            fats_per_100g=Decimal("5.00"),
            carbs_per_100g=Decimal("30.00"),
            created_by=self.owner,
        )

        self.detail_url = reverse(
            "product-detail",
            kwargs={"pk": self.product.pk},
        )

        self.update_payload = {
            "name": "Обновленный продукт",
        }

    def test_owner_can_update_own_product(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            self.detail_url,
            self.update_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.product.refresh_from_db()
        self.assertEqual(self.product.name, "Обновленный продукт")

    def test_other_user_cannot_update_foreign_product(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            self.detail_url,
            self.update_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.product.refresh_from_db()
        self.assertEqual(self.product.name, "Тестовый продукт")

    def test_admin_can_update_any_product(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            self.detail_url,
            self.update_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.product.refresh_from_db()
        self.assertEqual(self.product.name, "Обновленный продукт")

    def test_owner_can_delete_own_product(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())

    def test_other_user_cannot_delete_foreign_product(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Product.objects.filter(pk=self.product.pk).exists())

    def test_admin_can_delete_any_product(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())

    def test_unauthenticated_user_cannot_update_product(self):
        response = self.client.patch(
            self.detail_url,
            self.update_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_delete_product(self):
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProductValidationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="validator_user",
            password="ValidatorPass123!",
        )

        self.list_url = reverse("product-list")
        self.client.force_authenticate(user=self.user)

        self.valid_payload = {
            "name": "Нормальный продукт",
            "calories_per_100g": "250.00",
            "proteins_per_100g": "10.00",
            "fats_per_100g": "5.00",
            "carbs_per_100g": "30.00",
        }

    def test_product_with_blank_name_is_rejected(self):
        payload = {
            **self.valid_payload,
            "name": "   ",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_product_with_negative_calories_is_rejected(self):
        payload = {
            **self.valid_payload,
            "calories_per_100g": "-1.00",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("calories_per_100g", response.data)

    def test_product_with_negative_proteins_is_rejected(self):
        payload = {
            **self.valid_payload,
            "proteins_per_100g": "-1.00",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("proteins_per_100g", response.data)

    def test_product_with_negative_fats_is_rejected(self):
        payload = {
            **self.valid_payload,
            "fats_per_100g": "-1.00",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fats_per_100g", response.data)

    def test_product_with_negative_carbs_is_rejected(self):
        payload = {
            **self.valid_payload,
            "carbs_per_100g": "-1.00",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("carbs_per_100g", response.data)
