export interface Skill {
    id: string;
    name: string;
    xpRequired: number;
}

export const skills: Skill[] = [
    { id: 'focus1', name: 'Focus I', xpRequired: 50 },
    { id: 'focus2', name: 'Focus II', xpRequired: 150 },
    { id: 'focus3', name: 'Focus III', xpRequired: 250 },
    { id: 'discipline1', name: 'Discipline I', xpRequired: 300 },
    { id: 'discipline2', name: 'Discipline II', xpRequired: 600 },
];