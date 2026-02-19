// subId
function initSubid() {
    const urlParams = new URLSearchParams(window.location.search);
    const subid = urlParams.get('subid');
    if (subid) {
        localStorage.setItem('subid', subid);
        sessionStorage.setItem('subid', subid);
        document.getElementById('subid').value = subid;
    } else {
        const stored = localStorage.getItem('subid') || sessionStorage.getItem('subid');
        if (stored) document.getElementById('subid').value = stored;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// dataLayer
document.addEventListener('DOMContentLoaded', () => {
    window.dataLayer = window.dataLayer || [];
    initSubid();

    document.getElementById('cta-btn').addEventListener('click', () => {
        dataLayer.push({event: 'cta_click'});
        document.getElementById('lead-form').classList.remove('hidden');
        document.getElementById('cta-btn').classList.add('hidden');
    });

    const form = document.getElementById('lead-form');
    const successEl = document.getElementById('success');
    const errorEl = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.classList.add('hidden');

        const subid = document.getElementById('subid').value;
        if (!subid) {
            errorEl.textContent = 'Ошибка: отсутствует идентификатор сессии.';
            errorEl.classList.remove('hidden');
            return;
        }

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const consent = document.getElementById('consent').checked;

        if (!name || !email || !consent) {
            errorEl.textContent = 'Заполните все поля и согласитесь с условиями.';
            errorEl.classList.remove('hidden');
            return;
        }

        if (!isValidEmail(email)) {
            errorEl.textContent = 'Введите корректный email.';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('/api/submit.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, email, subid})
            });

            const data = await response.json();

            if (response.ok && data.success) {
                dataLayer.push({
                    event: 'lead_submit',
                    name,
                    email,
                    subid
                });

                form.classList.add('hidden');
                successEl.classList.remove('hidden');

                sendPostback({name, email, subid});
            } else {
                errorEl.textContent = data.error || 'Ошибка сервера. Попробуйте позже.';
                errorEl.classList.remove('hidden');
            }
        } catch (err) {
            errorEl.textContent = 'Ошибка сервера. Попробуйте позже.';
            errorEl.classList.remove('hidden');
        }
    });
});

function sendPostback(formData) {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = window.location.hostname;
    const gclid = urlParams.get('gclid');
    const fbclid = urlParams.get('fbclid');

    const postbackData = new URLSearchParams({
        subid: formData.subid,
        status: 'lead',
        name: formData.name,
        email: formData.email,
        domain
    });
    if (gclid) postbackData.append('gclid', gclid);
    if (fbclid) postbackData.append('fbclid', fbclid);

    const baseUrl = window.POSTBACK_URL;
    if (!baseUrl) return;
    const url = `${baseUrl}?${postbackData.toString()}`;
    fetch(url, {mode: 'no-cors', keepalive: true})
        .then(() => console.log('Postback sent:', url))
        .catch(() => console.log('Postback fire-and-forget'));
}
