export class ReorderWorkwearCommand {
    constructor(public readonly items: { id: string; order: number }[]) {}
}
