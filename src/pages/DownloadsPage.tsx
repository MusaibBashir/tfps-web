"use client"
import { Download, BookOpen } from "lucide-react"

const DownloadsPage = () => {
  return (
    <section id="downloads" className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Downloads
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Access our user guides and documentation for the Smart Media Organizer application.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction Section */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex gap-4 items-start">
              <BookOpen className="h-8 w-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Smart Media Organizer - User Guide</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to Smart Media Organizer. This tool helps photographers and videographers cull, organize, and
                  rename large collections of media efficiently.
                </p>
              </div>
            </div>
          </div>

          {/* Installation Section */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex gap-4 items-start">
              <Download className="h-8 w-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Installation</h4>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-amber-500 text-white rounded-full text-sm">
                        📁
                      </span>
                      Windows Users
                    </h5>
                    <ol className="space-y-2 ml-8 text-gray-700">
                      <li className="flex gap-3">
                        <span className="font-semibold text-amber-600">1.</span>
                        <span>Click the Download button to get the SmartMediaOrganizer.exe file.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-amber-600">2.</span>
                        <span>
                          Move the file to a convenient location (e.g., your Desktop or a specific tools folder).
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-amber-600">3.</span>
                        <span>Double-click to run.</span>
                      </li>
                    </ol>
                    <p className="mt-4 ml-8 p-3 bg-blue-50 border-l-4 border-blue-400 text-gray-700 text-sm">
                      <strong>Note:</strong> If Windows Defender or your antivirus warns you about an "Unrecognized
                      App", click <strong>More Info &gt; Run Anyway</strong>. This happens because the app is not
                      digitally signed with a costly certificate.
                    </p>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-amber-500 text-white rounded-full text-sm">
                        🍎
                      </span>
                      macOS Users
                    </h5>
                    <ol className="space-y-2 ml-8 text-gray-700">
                      <li className="flex gap-3">
                        <span className="font-semibold text-amber-600">1.</span>
                        <span>Click the Download button to get the SmartMediaOrganizer-Mac.zip file.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-amber-600">2.</span>
                        <span>
                          Double-click the zip file to extract it. You will see the SmartMediaOrganizer application
                          icon.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-amber-600">3.</span>
                        <span>Drag the app into your Applications folder.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-amber-600">4.</span>
                        <span className="font-semibold">Important (First Run Only):</span>
                      </li>
                    </ol>
                    <ul className="space-y-2 ml-12 text-gray-700 mt-2">
                      <li className="flex gap-3">
                        <span>•</span>
                        <span>
                          Because this app is not from the App Store, you cannot just double-click it the first time.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span>•</span>
                        <span>
                          Right-click (or Control-click) the app icon and select <strong>Open</strong>.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span>•</span>
                        <span>
                          A dialog will appear warning you about an unidentified developer. Click <strong>Open</strong>{" "}
                          in this dialog.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span>•</span>
                        <span>You only need to do this once.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prerequisites Section */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Prerequisites</h4>
            <div className="space-y-3 text-gray-700">
              <div className="flex gap-3">
                <span className="font-semibold text-amber-600">✓</span>
                <span>
                  <strong>No Python needed:</strong> The app is self-contained. You do not need to install Python or any
                  libraries.
                </span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-amber-600">✓</span>
                <span>
                  <strong>VLC Media Player (Recommended):</strong> For the best video playback experience, please ensure
                  VLC Media Player is installed on your system. The app will automatically detect it.
                </span>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <h4 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h4>

            <div className="space-y-6">
              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-3 bg-amber-50 px-3 py-2 rounded-lg inline-block">
                  Tab 1: Visual Sorter
                </h5>
                <p className="text-gray-700 mb-3">
                  <strong>Best for:</strong> Culling bad shots and separating keepers.
                </p>
                <ol className="space-y-2 ml-8 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-semibold text-amber-600">1.</span>
                    <span>
                      <strong>Configuration:</strong>
                    </span>
                  </li>
                </ol>
                <ul className="space-y-1 ml-16 text-gray-700">
                  <li>
                    • Click <strong>Select Source</strong> to pick the folder containing your photos/videos.
                  </li>
                  <li>
                    • (Optional) Click <strong>Select Destination</strong> if you want the sorted folders to be created
                    somewhere else.
                  </li>
                  <li>
                    • <strong>Show RAW Files:</strong> Check this if you want to review CR2, NEF, ARW files directly.
                    Note: This may be slower than reviewing JPEGs.
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-3 bg-amber-50 px-3 py-2 rounded-lg inline-block">
                  Tab 3: Sequence Sorter
                </h5>
                <p className="text-gray-700 mb-3">
                  <strong>Best for:</strong> Organizing photos in sequence order.
                </p>
                <div className="ml-8 text-gray-700 space-y-2">
                  <p>
                    <strong>Important Notes:</strong>
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>• You may need to add zeroes (e.g., 001) to make them sort correctly.</li>
                    <li>• Be aware that the photos must be in the order they were taken for this to work properly.</li>
                  </ul>
                  <p className="mt-3">
                    <strong>Action:</strong> Click <strong>SORT NOW</strong> to process the folder.
                  </p>
                  <p>
                    <strong>Rename After Sorting:</strong> Click to rename files after sorting them into sequence order.
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>
                      • <strong>Scene Name:</strong> Enter a name (e.g., "Wedding_Ceremony").
                    </li>
                    <li>
                      • <strong>Start Number:</strong> Enter a number (e.g., 1).
                    </li>
                    <li>
                      • <strong>Camera Name:</strong> (Optional) Enter a camera identifier (e.g., "SonyA7"). If left
                      blank, the app will try to read the Camera Model from the metadata.
                    </li>
                    <li>
                      • <strong>Result:</strong> Files will be renamed as SceneName_001_CameraName.jpg,
                      SceneName_002_..., sorted by the time they were taken.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-3 bg-amber-50 px-3 py-2 rounded-lg inline-block">
                  Tab 4: GPS
                </h5>
                <p className="text-gray-700 mb-3">
                  <strong>Best for:</strong> Geotagging images without location information.
                </p>
                <ol className="space-y-2 ml-8 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-semibold text-amber-600">1.</span>
                    <span>
                      <strong>Select Source:</strong> Browse to the folder containing your files.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-amber-600">2.</span>
                    <span>
                      <strong>Load GPS:</strong> Load a GPS file from your phone or GPS device.
                    </span>
                  </li>
                </ol>
                <ul className="space-y-1 ml-16 text-gray-700 mb-3">
                  <li>• .gpx, .kml, .kmz, and .csv files are supported.</li>
                  <li>
                    • The app will try to match the photo's time with the GPS data and apply the appropriate GPS
                    coordinates to the image's metadata.
                  </li>
                </ul>
                <div className="ml-8 space-y-2 text-gray-700">
                  <p>
                    <strong>Settings:</strong>
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>
                      • <strong>Time Zone:</strong> Set the time zone for the GPS data.
                    </li>
                    <li>
                      • <strong>Time Adjustment:</strong> Adjust the time if the camera's clock was not set correctly.
                    </li>
                  </ul>
                  <p className="mt-2">
                    <strong>Action:</strong> Click <strong>GEOCODE</strong> to apply the GPS coordinates to the images.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Section */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <h4 className="text-2xl font-bold text-gray-900 mb-6">Keyboard Shortcuts</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-gray-700">
                <thead>
                  <tr className="border-b-2 border-amber-500">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Windows</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Mac</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { action: "Previous Image", windows: "Left Arrow", mac: "Left Arrow" },
                    { action: "Next Image", windows: "Right Arrow", mac: "Right Arrow" },
                    { action: "Open File (Ext. Player)", windows: "P", mac: "P" },
                    { action: "Rename File", windows: "R", mac: "R" },
                    { action: "Mark Green / Group 1", windows: "Ctrl + 1", mac: "Cmd + 1" },
                    { action: "Mark Yellow / Group 2", windows: "Ctrl + 2", mac: "Cmd + 2" },
                    { action: "Mark Red / Group 3", windows: "Ctrl + 3", mac: "Cmd + 3" },
                    { action: "Group 4", windows: "Ctrl + 4", mac: "Cmd + 4" },
                    { action: "Group 5", windows: "Ctrl + 5", mac: "Cmd + 5" },
                    { action: "Zoom", windows: "Scroll Wheel", mac: "Scroll Wheel" },
                  ].map((shortcut, idx) => (
                    <tr key={idx} className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-amber-50/30" : ""}`}>
                      <td className="py-3 px-4 font-medium">{shortcut.action}</td>
                      <td className="py-3 px-4">{shortcut.windows}</td>
                      <td className="py-3 px-4">{shortcut.mac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <button className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto">
              <Download className="h-5 w-5" />
              Download Smart Media Organizer
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DownloadsPage
