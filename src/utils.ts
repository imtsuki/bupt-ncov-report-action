export async function sleep(ms: number): Promise<void> {
    console.log(`Sleep for ${ms}ms...`);
    await new Promise(resolve => setTimeout(resolve, ms));
}

export function randomBetween(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
