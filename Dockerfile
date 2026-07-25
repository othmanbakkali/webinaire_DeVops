# Utilisez une image Python officielle légère
FROM python:3.12-slim

# Éviter l'écriture de fichiers .pyc et forcer l'affichage immédiat des logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Installer les dépendances système requises pour compiler psycopg2 et se connecter à PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copier l'intégralité du projet dans le conteneur
COPY . /app/

# Exposer le port de l'application Django
EXPOSE 8000

# Commande par défaut pour démarrer le serveur de développement Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
