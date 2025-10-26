const UserDetail = () => {
  const sharedPhotos = [
    { id: 1, name: "./background.jpg" },
    { id: 2, name: "photo_2024_2.png" },
    { id: 3, name: "photo_2024_3.png" },
    { id: 4, name: "photo_2024_4.png" },
  ];

  return (
    <section className="flex-1  flex flex-col">
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User Profile */}
        <div className="flex flex-col items-center text-center">
          <img
            src="./avatar.png"
            className="w-20 h-20 rounded-full mb-3 object-cover"
            alt="User avatar"
          />
          <h2 className="font-semibold text-lg">Jane Doe</h2>
          <p className="text-xs text-gray-400 mt-1">
            Lorem ipsum dolor sit amet.
          </p>
        </div>

        {/* Chat Settings */}
        <div className="space-y-2">
          <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
            <span className="text-sm">Chat Settings</span>
            <img src="./arrowUp.png" alt="Expand" className="w-4 h-4" />
          </button>
          <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
            <span className="text-sm">Notifications</span>
            <img src="./arrowUp.png" alt="Expand" className="w-4 h-4" />
          </button>
          <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
            <span className="text-sm">Privacy & help</span>
            <img src="./arrowUp.png" alt="Expand" className="w-4 h-4" />
          </button>
        </div>

        {/* Shared Photos */}
        <div>
          <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors mb-2">
            <span className="text-sm font-medium">Shared photos</span>
            <img src="./arrowDown.png" alt="Collapse" className="w-4 h-4" />
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
                    alt="Shared photo"
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="text-xs text-gray-300">{photo.name}</span>
                </div>
                <img
                  src="./download.png"
                  alt="Download"
                  className="w-4 h-4 cursor-pointer hover:opacity-80"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Shared Files */}
        <div>
          <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
            <span className="text-sm font-medium">Shared Files</span>
            <img src="./arrowUp.png" alt="Expand" className="w-4 h-4" />
          </button>
        </div>

        {/* Block User Button - Sticky at bottom when scrolling */}
        <div className="pt-4">
          <button className="w-full bg-red-900/50 hover:bg-red-900/70 text-white p-3 rounded-lg transition-colors font-medium">
            Block User
          </button>
          <button className="w-full mt-2 bg-slate-800/50 hover:bg-slate-800/70 text-red-400 p-3 rounded-lg transition-colors font-medium">
            Report User
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserDetail;
