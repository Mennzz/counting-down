
import { Image, Heart } from "lucide-react";

const PhotoGallery = () => {
  // Placeholder photos - users can replace these with their own
  const photos = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400",
      caption: "Our cozy evening together",
      date: "December 2024"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400",
      caption: "Lazy Sunday mornings",
      date: "November 2024"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400",
      caption: "Sharing sweet moments",
      date: "October 2024"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400",
      caption: "Under the stars",
      date: "September 2024"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400",
      caption: "Magical nights",
      date: "August 2024"
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
