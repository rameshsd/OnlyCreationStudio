
import { Post } from '@/components/post-card';
import { type Short } from '@/lib/shorts-data';

const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Kevin", "Linda", "Mallory", "Nancy", "Oscar", "Peggy", "Quentin", "Romeo", "Sybil", "Trent", "Ursula", "Victor", "Walter", "Xavier", "Yvonne", "Zelda"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

const captions = [
    "Just living my best life. ✨",
    "Another beautiful day!",
    "Check out this amazing view!",
    "New content coming soon. #staytuned",
    "Feeling grateful today.",
    "What do you guys think of this?",
    "Throwback to an amazing trip.",
    "Working on something exciting!",
    "Sunday vibes. ☕️",
    "Couldn't have done it without my amazing team.",
    "Exploring new horizons.",
    "A little progress each day adds up to big results.",
    "Behind the scenes of my latest project.",
    "So excited to share this with you all!",
    "Chasing dreams and making memories.",
];

const hints = ["fashion", "travel", "food", "tech", "nature", "cityscape", "abstract", "art", "fitness", "work", "lifestyle", "pet", "car", "music", "gaming"];

const imagePool = [
    { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'fashion' },
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'portrait' },
    { url: 'https://images.unsplash.com/photo-1488161628813-04466f872d24?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'travel' },
    { url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'lifestyle' },
    { url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'food' },
    { url: 'https://images.unsplash.com/photo-1526657782461-9fe13507e03f?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'tech' },
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'nature' },
    { url: 'https://images.unsplash.com/photo-1505761671935-60b3a742750f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', hint: 'cityscape' },
];

const avatarPool = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomName = () => `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
const generateUsername = (name: string) => name.toLowerCase().replace(/\s/g, '_') + Math.floor(Math.random() * 100);

export const generateMockPosts = (count: number): Post[] => {
    const posts: Post[] = [];
    for (let i = 0; i < count; i++) {
        const name = generateRandomName();
        const username = generateUsername(name);
        const hasMedia = Math.random() > 0.1;
        const mediaCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1; // 2-4 items or 1
        
        posts.push({
            id: `post_${i}_${Date.now()}`,
            userId: `user_${Math.floor(Math.random() * 1000)}`,
            username: username,
            userAvatar: getRandomElement(avatarPool),
            userIsVerified: Math.random() > 0.7,
            caption: getRandomElement(captions),
            media: hasMedia ? Array.from({ length: mediaCount }, (_, j) => getRandomElement(imagePool)) : [],
            likes: Math.floor(Math.random() * 25000),
            comments: Math.floor(Math.random() * 1000),
            shares: Math.floor(Math.random() * 500),
            createdAt: {
                seconds: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600 * 24 * 30), // Sometime in the last month
                nanoseconds: 0,
            },
        });
    }
    return posts;
};

export const generateMockStories = (count: number) => {
    const stories = [{ name: "My Story", avatar: null, isSelf: true, hint: "add story" }];
    for (let i = 0; i < count; i++) {
        const name = getRandomElement(firstNames);
        stories.push({
            name,
            avatar: getRandomElement(avatarPool),
            isSelf: false,
            hint: "portrait",
        });
    }
    return stories;
}

export const generateMockTrendingTopics = (count: number) => {
    const topics = ["#AIinMarketing", "#SustainableFashion", "#CreatorEconomy", "#Web3", "#IndieDev", "#DigitalNomad", "#FutureOfWork", "#UIUX", "#NextJSTrends", "#Firebase"];
    const generatedTopics: string[] = [];
    while (generatedTopics.length < count && topics.length > 0) {
        const randomIndex = Math.floor(Math.random() * topics.length);
        generatedTopics.push(topics.splice(randomIndex, 1)[0]);
    }
     while (generatedTopics.length < count) {
        generatedTopics.push(`#NewTopic${generatedTopics.length + 1}`);
    }
    return generatedTopics;
};

export const generateMockSuggestions = (count: number) => {
    const suggestions = [];
    for (let i = 0; i < count; i++) {
        const name = generateRandomName();
        suggestions.push({
            name: name,
            username: `@${generateUsername(name)}`,
            avatar: getRandomElement(avatarPool),
            hint: "user avatar"
        });
    }
    return suggestions;
};

export const generateMockCollabRequests = (count: number, type: 'received' | 'sent') => {
    const requests = [];
    for (let i = 0; i < count; i++) {
        const from = `${getRandomElement(firstNames)} Corp`;
        const to = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
        const project = `${getRandomElement(hints)} Campaign`;
        const status = getRandomElement(["pending", "accepted", "declined"]);
        requests.push({
            id: i + 1,
            from: from,
            to: to,
            project: project,
            status: status,
            avatar: getRandomElement(avatarPool),
        });
    }
    return requests;
}

export const generateMockExploreItems = (count: number) => {
    const items = [];
    for(let i=0; i< count; i++) {
        const name = getRandomElement(firstNames);
        const image = getRandomElement(imagePool);
        items.push({
            name: name,
            age: `${Math.floor(Math.random() * 15) + 17} y.o`,
            image: image.url,
            hint: image.hint,
        })
    }
    return items;
}

export const generateMockMessages = (count: number) => {
    const conversations = [];
    const messages: { [key: number]: any[] } = {};

    for (let i = 1; i <= count; i++) {
        const name = `${getRandomElement(firstNames)} Inc.`;
        conversations.push({
            id: i,
            name: name,
            lastMessage: getRandomElement(captions).substring(0,40),
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
            unread: Math.floor(Math.random() * 5),
            online: Math.random() > 0.5,
        });

        messages[i] = Array.from({length: Math.ceil(Math.random() * 10)}, (_, msgIndex) => ({
            from: Math.random() > 0.5 ? "me" : "other",
            text: getRandomElement(captions),
            time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM': 'PM'}`
        }));
    }
    return { conversations, messages };
}
