export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logBackendStartup } = await import('@/lib/backendOrigin');
    logBackendStartup();
  }
}
