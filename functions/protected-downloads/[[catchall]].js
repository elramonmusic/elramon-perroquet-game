export async function onRequest() {
  return new Response("403 Accès interdit : Ce fichier est protégé. Veuillez vous connecter.", {
    status: 403,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
  });
}
