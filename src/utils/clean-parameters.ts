export const cleanParameters = <T extends Record<string, unknown>>(parameters: T): Partial<T> => {
    return Object.fromEntries(
        Object.entries(parameters).filter(([_, v]) => v !== undefined && v !== null && v !== ''),
    ) as Partial<T>
}
