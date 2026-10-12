# T@S Python Client SDK (`t-at-s`)

> **"You say it. T@S makes it happen."**  
> *The Universal AI Voice Agent Platform that executes real actions in your software.*

---

## 🚀 Overview

`t-at-s` is the official Python/Django client library for connecting your backend services to the **T@S Acoustic Action Engine**. With a single `@tats_action` decorator, any Python service or API endpoint automatically becomes an intelligent tool executable via natural speech or text by end-users.

---

## 📦 Installation

```bash
pip install t-at-s
```

*(Or for local development: `pip install -e sdk/python`)*

---

## ⚡ Quick Start (Django in 3 Steps)

### Step 1: Decorate Your Functions with `@tats_action`

In any Django app (`services.py` or `views.py`), decorate the functions you want your AI agent to trigger:

```python
from t_at_s import tats_action

@tats_action(
    description="Creates a new task in the workspace with title and priority"
)
def create_task(title: str, priority: str = "medium", user_id: str = None) -> dict:
    """
    :param title: The title of the task to create
    :param priority: Priority level ('low', 'medium', 'high')
    """
    # Executes under the authentic user_id injected by T@S Engine
    print(f"Creating task for user {user_id}: {title} [{priority}]")
    return {
        "status": "created",
        "task_id": "tsk_1092",
        "title": title
    }
```

The SDK **automatically inspects your Python type hints and docstrings** to generate standard OpenAPI function-calling schemas for Llama 3.3.

---

### Step 2: Mount the Webhook URLs & Middleware

In your Django `urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # Mounts /api/tats/dispatch/ and /api/tats/actions/<action_name>/
    path('api/tats/', include('t_at_s.urls')),
]
```

In your Django `settings.py`:

```python
INSTALLED_APPS += [
    't_at_s',
]

MIDDLEWARE += [
    't_at_s.middleware.TATSMiddleware',
]

# Configure your T@S Credentials
T_AT_S_API_KEY = "tas_live_..."       # From T@S Dashboard /api/v1/apps/
T_AT_S_SERVICE_KEY = "tas_srv_..."   # Verifies incoming tool webhooks
T_AT_S_ENGINE_URL = "https://engine.t-at-s.com"
```

---

### Step 3: Sync Actions to the T@S Engine

Run the management command to publish all your decorated `@tats_action` tools to the T@S Engine:

```bash
python manage.py tats_sync
```

Output:
```
Found 1 local actions to sync with T@S Engine...
  [SYNCED] create_task

Sync complete! (1/1 tools live on T@S Engine)
```

---

## 🧠 Programmatic Python Client (`TATSClient`)

You can also interact directly with the T@S Engine from any Python backend, script, or Celery task:

```python
from t_at_s import TATSClient

client = TATSClient(
    api_key="tas_live_...",
    base_url="https://engine.t-at-s.com"
)

# 1. Check health
health = client.health()

# 2. Run an end-user conversation
response = client.chat(
    client_user_id="usr_alex_001",
    session_id="session_xyz",
    message="Schedule a team sync tomorrow at 10 AM",
    is_voice=True
)

print("Agent Spoken Reply:", response['speech_response'])
print("Client UI Event:", response['events'])
print("Units Consumed:", response['units']['consumed'])
```

---

## 🔒 Security & Tenancy

1. **Service Verification Key (`X-Service-Key`)**: All webhook calls from the T@S Engine to your application are authenticated using your private `tas_srv_...` key.
2. **User Tenancy Scoping (`X-User-Id`)**: The T@S Engine passes the authenticated end-user's ID on every tool dispatch, ensuring actions only run with the caller's authorized permissions.
3. **Zero Secrets in DB**: Live API keys and service keys are hashed using SHA-256 before storage in the engine.

---

## 📄 License

MIT License — Copyright (c) 2026 T@S Platform.
