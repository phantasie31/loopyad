// Configuration unique pour tout le site
const SUPABASE_URL = 'https://srfxehetueqazykzwrhw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZnhlaGV0dWVxYXp5a3p3cmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjQ4NjksImV4cCI6MjA5MjU0MDg2OX0.tqw6lik68x0js0VVm-xAuLFZ17mFf3LM6h5g85eow68';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkGlobalAuth() {
    const { data: { session } } = await _supabase.auth.getSession();
    
    // Si pas de session et qu'on n'est pas sur Login, on redirige
    if (!session && !window.location.pathname.includes('Login.html')) {
        window.location.href = 'Login.html';
        return;
    }

    if (session) {
        const user = session.user;
        
        // On cherche l'utilisateur dans les 3 tables possibles
        const [ann, hot, adm] = await Promise.all([
            _supabase.from('annonceurs').select('*').eq('id', user.id).single(),
            _supabase.from('hotes').select('*').eq('id', user.id).single(),
            _supabase.from('admins').select('*').eq('id', user.id).single()
        ]);

        const profile = ann.data || hot.data || adm.data;
        const role = ann.data ? 'annonceur' : (hot.data ? 'hote' : 'admin');

        // Mise à jour automatique de l'interface si les éléments existent
        if (profile) {
            const infoEl = document.getElementById('info-profil');
            if (infoEl) {
                if (role === 'annonceur') {
                    infoEl.innerHTML = `Offre : <b class="text-white">${profile.offre || 'Standard'}</b> | Écrans : <b class="text-white">${profile.nb_ecrans || 0}</b>`;
                } else if (role === 'hote') {
                    infoEl.innerHTML = `Établissement : <b class="text-white">${profile.nom_etablissement}</b> | Status : <b class="text-white">Hôte</b>`;
                }
            }
        }
    }
}

// Lancement automatique au chargement de chaque page
document.addEventListener('DOMContentLoaded', checkGlobalAuth);
