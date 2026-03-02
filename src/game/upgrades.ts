export type UpgradeOption =
    | { type: 'attack'; value: number }
    | { type: 'speed'; value: number }
    | { type: 'accountXpBoost'; value: number };

export function generateUpgradeOptions(): UpgradeOption[] {
    return [
        { type: 'attack', value: 1 },
        { type: 'speed', value: 1 },
        { type: 'accountXpBoost', value: 1 },
    ];
}
