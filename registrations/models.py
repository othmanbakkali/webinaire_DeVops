from django.db import models

class Registration(models.Model):
    ROLE_CHOICES = [
        ('student', 'Étudiant IT'),
        ('developer', 'Développeur (Débutant/Confirmé)'),
        ('cloud_enthusiast', 'Passionné du Cloud'),
        ('other', 'Autre'),
    ]

    full_name = models.CharField(max_length=150, verbose_name="Nom Complet")
    email = models.EmailField(unique=True, verbose_name="Adresse E-mail")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, verbose_name="Profil")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'Inscription")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Inscription"
        verbose_name_plural = "Inscriptions"

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"
