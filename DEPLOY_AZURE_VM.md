# Azure VM Deployment Guide

This project should be deployed as two separate services on your Azure VM:

- Frontend: React + Vite build served by Nginx
- Backend: Django served by Gunicorn behind Nginx

Your current public IP is `51.120.124.180`.

## Repo-specific warning

The frontend now supports a separate backend host through `VITE_API_BASE_URL`.

But the current Django backend does not yet implement these frontend-used endpoints:

- `POST /api/subscriptions/purchase`
- `POST /api/payments/intent`
- `POST /api/payments/confirm`

Those endpoints currently exist only in [server.ts](c:\Users\SHREE\Downloads\milkman-pro (2)\server.ts). If you deploy Django as backend today, those flows will fail until you port them into Django.

## 1. SSH into the VM

```bash
chmod 400 milkman-vm_key.pem
ssh -i milkman-vm_key.pem azureuser@51.120.124.180
```

If your VM user is different, replace `azureuser`.

## 2. Install packages

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx nodejs npm git
sudo npm install -g pm2
```

## 3. Clone the project

```bash
cd /var/www
sudo git clone <YOUR_GITHUB_REPO_URL> milkman-pro
sudo chown -R $USER:$USER /var/www/milkman-pro
cd /var/www/milkman-pro
```

## 4. Deploy the Django backend

```bash
cd /var/www/milkman-pro/backend_django
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Create `/var/www/milkman-pro/backend_django/.env`:

```env
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=51.120.124.180,127.0.0.1,localhost
DJANGO_CORS_ALLOWED_ORIGINS=http://51.120.124.180
DJANGO_CSRF_TRUSTED_ORIGINS=http://51.120.124.180
```

Test Gunicorn:

```bash
cd /var/www/milkman-pro/backend_django
source venv/bin/activate
export $(grep -v '^#' .env | xargs)
gunicorn --bind 127.0.0.1:8000 milkman_pro.wsgi:application
```

Create `/etc/systemd/system/milkman-gunicorn.service`:

```ini
[Unit]
Description=Milkman Django Gunicorn
After=network.target

[Service]
User=azureuser
Group=www-data
WorkingDirectory=/var/www/milkman-pro/backend_django
EnvironmentFile=/var/www/milkman-pro/backend_django/.env
ExecStart=/var/www/milkman-pro/backend_django/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 milkman_pro.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable milkman-gunicorn
sudo systemctl start milkman-gunicorn
sudo systemctl status milkman-gunicorn
```

## 5. Build the frontend

Create `/var/www/milkman-pro/.env.production`:

```env
VITE_API_BASE_URL=http://51.120.124.180
```

Then:

```bash
cd /var/www/milkman-pro
npm install
npm run build
```

## 6. Configure Nginx

Create `/etc/nginx/sites-available/milkman`:

```nginx
server {
    listen 80;
    server_name 51.120.124.180;

    root /var/www/milkman-pro/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/milkman-pro/backend_django/staticfiles/;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/milkman /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Azure NSG ports

Open these inbound ports in Azure:

- `22` for SSH
- `80` for HTTP
- `443` for HTTPS later

## 8. When you split domains later

Example:

- frontend: `https://milkmanpro.com`
- backend: `https://api.milkmanpro.com`

Then update:

- frontend `.env.production`: `VITE_API_BASE_URL=https://api.milkmanpro.com`
- backend `.env`: `DJANGO_ALLOWED_HOSTS=api.milkmanpro.com,...`
- backend `.env`: `DJANGO_CORS_ALLOWED_ORIGINS=https://milkmanpro.com`
- backend `.env`: `DJANGO_CSRF_TRUSTED_ORIGINS=https://milkmanpro.com`

## 9. PM2 note

PM2 is not needed for this target architecture.

Use:

- Nginx for frontend static files
- Gunicorn for Django
- systemd to keep Gunicorn running

Use PM2 only if you decide to run the Node backend in [server.ts](c:\Users\SHREE\Downloads\milkman-pro (2)\server.ts) instead of Django.
