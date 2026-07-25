from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import IntegrityError
import json
import re
from .models import Registration

def home_view(request):
    registration_count = Registration.objects.count()
    context = {
        'registration_count': registration_count,
        # Default mock comments to make the page interactive immediately
        'default_comments': [
            {'name': 'Amine El Amrani', 'role': 'Développeur Fullstack', 'text': 'Interested! Hâte de découvrir le workflow CI/CD.', 'time': 'Il y a 10 min'},
            {'name': 'Sarah Benziane', 'role': 'Étudiante IT', 'text': 'Interested! Super initiative, merci pour ce webinaire gratuit.', 'time': 'Il y a 1 h'},
            {'name': 'Yassine Mounir', 'role': 'Passionné du Cloud', 'text': 'Interested! Git et Docker sont indispensables aujourd\'hui.', 'time': 'Il y a 3 h'},
        ]
    }
    return render(request, 'index.html', context)

@require_POST
def register_api_view(request):
    try:
        data = json.loads(request.body)
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip()
        role = data.get('role', '').strip()

        # Simple validations
        if not full_name:
            return JsonResponse({'success': False, 'error': 'Veuillez saisir votre nom complet.'}, status=400)
        if not email:
            return JsonResponse({'success': False, 'error': 'Veuillez saisir votre adresse e-mail.'}, status=400)
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            return JsonResponse({'success': False, 'error': 'Format d\'adresse e-mail invalide.'}, status=400)
        if not role or role not in [choice[0] for choice in Registration.ROLE_CHOICES]:
            return JsonResponse({'success': False, 'error': 'Veuillez sélectionner un profil valide.'}, status=400)

        # Create registration
        registration = Registration.objects.create(
            full_name=full_name,
            email=email,
            role=role
        )

        return JsonResponse({
            'success': True,
            'message': f'Félicitations {registration.full_name}, votre inscription a été enregistrée avec succès !',
            'count': Registration.objects.count()
        })

    except IntegrityError:
        return JsonResponse({'success': False, 'error': 'Cette adresse e-mail est déjà inscrite au webinaire.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Format de données invalide.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': 'Une erreur est survenue lors de l\'inscription.'}, status=500)
