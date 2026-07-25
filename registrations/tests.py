from django.test import TestCase, Client
from django.urls import reverse
import json
from .models import Registration

class RegistrationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.home_url = reverse('home')
        self.register_url = reverse('register_api')

    def test_home_page_status_and_content(self):
        """Verify the home page loads successfully and contains webinar info."""
        response = self.client.get(self.home_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "le Parcours")
        self.assertContains(response, "Dr. OTHMAN BAKKALI YEDRI")
        self.assertIn('registration_count', response.context)

    def test_successful_registration(self):
        """Verify that registering with valid details succeeds and persists in the DB."""
        payload = {
            'full_name': 'Test User',
            'email': 'testuser@example.com',
            'role': 'developer'
        }
        response = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['count'], 1)
        
        # Verify persistence
        self.assertTrue(Registration.objects.filter(email='testuser@example.com').exists())

    def test_missing_fields_registration(self):
        """Verify that registering with missing fields returns 400."""
        payload = {
            'full_name': '',
            'email': 'bademail@example.com',
            'role': 'developer'
        }
        response = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])

    def test_invalid_email_registration(self):
        """Verify that registering with a badly formatted email returns 400."""
        payload = {
            'full_name': 'Valid Name',
            'email': 'notanemail',
            'role': 'student'
        }
        response = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_duplicate_email_registration(self):
        """Verify that duplicate registrations are prevented and return 400."""
        Registration.objects.create(
            full_name='First Registrant',
            email='duplicate@example.com',
            role='cloud_enthusiast'
        )
        
        # Try to register same email again
        payload = {
            'full_name': 'Second Registrant',
            'email': 'duplicate@example.com',
            'role': 'student'
        }
        response = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("déjà inscrite", response.json()['error'])
