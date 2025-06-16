
import { Music, Heart, ExternalLink } from "lucide-react";

const PlaylistSection = () => {
  const songs = [
    { title: "Perfect", artist: "Ed Sheeran", type: "Our Song" },
    { title: "All of Me", artist: "John Legend", type: "Dance Song" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", type: "Long Distance" },
    { title: "A Thousand Years", artist: "Christina Perri", type: "Forever Song" },
    { title: "Make You Feel My Love", artist: "Adele", type: "Comfort Song" },
    { title: "Better Days", artist: "OneRepublic", type: "Hope Song" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Music className="w-6 h-6 text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Our Playlist</h2>
          <Music className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          The soundtrack to our love story
        </p>
      </div>

      <div className="love-card">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Music className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-playfair font-medium text-gray-800 mb-2">
            Songs That Tell Our Story
          </h3>
          <p className="text-gray-600 font-inter mb-4">
            Every melody holds a memory, every lyric speaks our truth
          </p>
          
          {/* Placeholder for Spotify/Apple Music embed */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl mb-6">
            <Music className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium mb-2">Connect Your Spotify Playlist</p>
            <p className="text-sm opacity-90 mb-4">
              Replace this section with your actual playlist embed code
            </p>
            <button className="flex items-center justify-center space-x-2 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors mx-auto">
              <ExternalLink className="w-4 h-4" />
              <span>Open in Spotify</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-playfair font-medium text-gray-800 mb-4">Featured Songs</h4>
          {songs.map((song, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
              <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{song.title}</div>
                <div className="text-sm text-gray-600">{song.artist}</div>
              </div>
              <span className="px-3 py-1 bg-rose-200 text-rose-700 text-xs font-medium rounded-full">
                {song.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="love-card inline-block">
          <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2 animate-heart-beat" />
          <p className="text-gray-600 font-inter italic">
            "Music is the language of the heart, and our playlist speaks volumes."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSection;
