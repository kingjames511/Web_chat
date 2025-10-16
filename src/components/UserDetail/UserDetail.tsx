const UserDetail = () => {
  const sharedPhotos = [
    { id: 1, name: "./background.jpg" },
    { id: 2, name: "photo_2024_2.png" },
    { id: 3, name: "photo_2024_2.png" },
    { id: 4, name: "photo_2024_2.png" },
  ];

  return (
    <section className="flex-1 p-4 overflow-y-auto">
      {/* User Profile */}
      <div className="flex flex-col items-center text-center mb-6">
        <img
          src="./avatar.png"
          className="w-20 h-20 rounded-full mb-3"
          alt=""
        />
        <h2 className="font-semibold text-lg">Jane Doe</h2>
        <p className="text-xs text-gray-400 mt-1">
          Lorem ipsum dolor sit amet.
        </p>
      </div>

      {/* Chat Settings */}
      <div className="space-y-2 mb-4">
        <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
          <span className="text-sm">Chat Settings</span>
          <img src="./arrowUp.png" alt="" className="w-4 h-4" />
        </button>
        <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
          <span className="text-sm">Chat Settings</span>
          <img src="./arrowUp.png" alt="" className="w-4 h-4" />
        </button>
        <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
          <span className="text-sm">Privacy & help</span>
          <img src="./arrowUp.png" alt="" className="w-4 h-4" />
        </button>
      </div>

      {/* Shared Photos */}
      <div className="mb-4">
        <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors mb-2">
          <span className="text-sm">Shared photos</span>
          <img src="./arrowDown.png" alt="" className="w-4 h-4" />
        </button>
        <div className="space-y-2 px-2">
          {sharedPhotos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center justify-between p-2 hover:bg-slate-800/30 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src="./background.jpg"
                  alt=""
                  className="w-10 h-10 rounded object-cover"
                />
                <span className="text-xs text-gray-300">{photo.name}</span>
              </div>
              <img
                src="./background.jpg"
                alt=""
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Shared Files */}
      <div className="mb-4">
        <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
          <span className="text-sm">Shared Files</span>
          <img src="./arrowUp.png" alt="" className="w-4 h-4" />
        </button>
      </div>

      {/* Block User Button */}
      <button className="w-full bg-red-900/50 hover:bg-red-900/70 text-white p-3 rounded-lg transition-colors">
        Block User
      </button>
    </section>
  );
};

export default UserDetail;
