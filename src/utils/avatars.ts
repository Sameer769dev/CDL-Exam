export const AVATARS = [
    { id: 'avatar_1', source: require('../../assets/Avatars/Avatar_1.png') },
    { id: 'avatar_2', source: require('../../assets/Avatars/Avatar_2.png') },
    { id: 'avatar_3', source: require('../../assets/Avatars/Avatar_3.png') },
];

export const getAvatarSource = (id: string | undefined) => {
    const avatar = AVATARS.find(a => a.id === id);
    return avatar ? avatar.source : AVATARS[0].source;
};
