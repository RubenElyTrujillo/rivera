
interface IMaterialsData {
    id: string;
    name: string;
    shortName: string;
    coverImage: string;
    description: string;
    spec: string;
    finishes: {
        name: string;
        code: string;
        collection: string;
        dims: string;
        image: string;
    }[];
}

export { 
    type IMaterialsData,
}