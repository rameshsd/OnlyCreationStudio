export interface Short {
    id: number;
    videoUrl: string;
    caption: string;
    user: {
      name: string;
      avatar: string;
    };
    likes: number;
    comments: number;
    shares: number;
  }
  
  export const shortsData: Short[] = [
    {
      id: 1,
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      caption: "Having a blast with this new gadget! #tech #gadget #unboxing",
      user: {
        name: "TechExplorer",
        avatar: "https://placehold.co/100x100.png?text=TE",
      },
      likes: 12500,
      comments: 342,
      shares: 189,
    },
    {
      id: 2,
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      caption: "Morning vibes and a perfect cup of coffee. ☕️ #coffee #morningroutine",
      user: {
        name: "CozyMornings",
        avatar: "https://placehold.co/100x100.png?text=CM",
      },
      likes: 8900,
      comments: 210,
      shares: 95,
    },
    {
      id: 3,
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      caption: "Pushing my limits at the gym today! #fitness #workout #motivation",
      user: {
        name: "FitFreak",
        avatar: "https://placehold.co/100x100.png?text=FF",
      },
      likes: 23000,
      comments: 876,
      shares: 450,
    },
    {
        id: 4,
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        caption: "A cinematic masterpiece. #animation #fantasy",
        user: {
          name: "MovieBuff",
          avatar: "https://placehold.co/100x100.png?text=MB",
        },
        likes: 54000,
        comments: 1200,
        shares: 980,
      },
      {
        id: 5,
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        caption: "Exploring the great outdoors. #adventure #travel #nature",
        user: {
          name: "Wanderlust",
          avatar: "https://placehold.co/100x100.png?text=W",
        },
        likes: 18000,
        comments: 560,
        shares: 320,
      },
  ];
  