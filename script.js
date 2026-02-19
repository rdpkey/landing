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
        if (!name || !email || !document.getElementById('consent').checked) {
            errorEl.textContent = 'Заполните все поля и согласитесь с условиями.';
            errorEl.classList.remove('hidden');
            return;
        }

        // lead_submit
        dataLayer.push({
            event: 'lead_submit',
            name,
            email,
            subid
        });

        // fetch с success=true 
        try {
            const response = await new Promise((resolve) => {
                setTimeout(() => resolve({ ok: true, status: 200 }), 1000);
            });
            if (response.ok) {
                form.classList.add('hidden');
                successEl.classList.remove('hidden');
                await sendPostback({ name, email, subid });
            }
        } catch (err) {
            errorEl.textContent = 'Ошибка сервера. Попробуйте позже.';
            errorEl.classList.remove('hidden');
        }
    });
});

async function sendPostback(formData) {
    const urlParams = new URLSearchParams(window.location.search);
    const subid = formData.subid;
    const domain = window.location.host || 'localhost';
    const gclid = urlParams.get('gclid');
    const fbclid = urlParams.get('fbclid');

    const postbackData = new URLSearchParams({
        subid,
        status: 'lead',
        name: formData.name,
        email: formData.email,
        domain
    });
    if (gclid) postbackData.append('gclid', gclid);
    if (fbclid) postbackData.append('fbclid', fbclid);

    

    const url = `https://track.xyz/pawe23f/postback?${postbackData.toString()}`;
    fetch(url, { mode: 'no-cors', keepalive: true })
        .then(() => console.log('Postback sent:', url))
        .catch(() => console.log('Postback fire-and-forget'));
}
