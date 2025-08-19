
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
            userAvatar: `https://placehold.co/100x100.png?text=${name.substring(0, 2).toUpperCase()}`,
            userIsVerified: Math.random() > 0.7,
            caption: getRandomElement(captions),
            media: hasMedia ? Array.from({ length: mediaCount }, (_, j) => ({
                type: 'image',
                url: `https://placehold.co/600x${Math.floor(Math.random() * 200) + 400}.png`,
                hint: getRandomElement(hints),
            })) : [],
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
            avatar: `https://placehold.co/100x100.png?text=${name.substring(0,2)}`,
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
            avatar: `https://placehold.co/100x100.png?text=${name.substring(0, 2)}`,
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
            avatar: `https://placehold.co/100x100.png?text=${type === 'received' ? from.substring(0,2) : to.substring(0,2)}`,
        });
    }
    return requests;
}

export const generateMockExploreItems = (count: number) => {
    const items = [];
    for(let i=0; i< count; i++) {
        const name = getRandomElement(firstNames);
        items.push({
            name: name,
            age: `${Math.floor(Math.random() * 15) + 17} y.o`,
            image: `https://placehold.co/400x600.png?text=${name.substring(0,2)}`,
            hint: "portrait female"
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
            avatar: `https://placehold.co/100x100.png?text=${name.substring(0,2)}`,
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

    