export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startLocalCron } = await import('@/lib/cron');
    startLocalCron();
  }
}
