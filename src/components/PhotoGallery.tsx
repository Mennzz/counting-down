
import { Image, Heart } from "lucide-react";

const PhotoGallery = () => {
  // Personal photos from your uploads
  const photos = [
    {
      id: 1,
      url: "/lovable-uploads/e5565d81-3635-49e2-9129-b9042ca2da63.png",
      caption: "Our little garden project together",
      date: "Spring 2024"
    },
    {
      id: 2,
      url: "/lovable-uploads/929d54ec-a5b3-4944-90aa-266679a22ca2.png",
      caption: "Board game night adventures",
      date: "Winter 2024"
    },
    {
      id: 3,
      url: "/lovable-uploads/ed981704-de9a-4757-b49f-88b96d52487e.png",
      caption: "Perfect sunny day at the park",
      date: "Summer 2024"
    },
    {
      id: 4,
      url: "/lovable-uploads/6ca5342f-0d62-4551-8ec5-b6714dc075ee.png",
      caption: "Game night cuddles",
      date: "Autumn 2024"
    },
    {
      id: 5,
      url: "/lovable-uploads/ef8a64bf-3d66-4f7f-a54d-e0b7c21d3b99.png",
      caption: "Cozy gaming sessions",
      date: "Winter 2024"
    },
    {
      id: 6,
      url: "/lovable-uploads/2d76729f-182d-4e1a-a678-68d0318f5885.png",
      caption: "Victory selfie!",
      date: "Recent"
    },
    {
      id: 7,
      url: "/lovable-uploads/ec8c9a9f-aa87-413c-842c-f22dd10cd9e7.png",
      caption: "Getting ready for our day",
      date: "Recent"
    },
    {
      id: 8,
      url: "/lovable-uploads/ef8f6e48-a439-45ec-8346-87d46f71841f.png",
      caption: "Exploring the city together",
      date: "Summer 2024"
    },
    {
      id: 9,
      url: "/lovable-uploads/71989c87-987c-4cb7-be18-32d262f6c090.png",
      caption: "Cooking adventures in the kitchen",
      date: "Recent"
    },
    {
      id: 10,
      url: "/lovable-uploads/742653a6-cd13-4446-9b4f-dd2393a47d9f.png",
      caption: "Our tomato harvest success",
      date: "Summer 2024"
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Image className="w-6 h-6 text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Our Memories</h2>
          <Image className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          Every picture tells our story
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="love-card group cursor-pointer overflow-hidden">
            <div className="relative">
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-64 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-medium mb-1">{photo.caption}</h3>
                <p className="text-sm opacity-90">{photo.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="love-card inline-block">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <p className="text-gray-600 font-inter">
              <span className="font-medium text-rose-600">{photos.length}</span> beautiful memories captured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
