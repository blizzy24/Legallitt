import Foundation
import Vision
import ImageIO
let root = URL(fileURLWithPath: CommandLine.arguments[1])
let files = FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil)!.compactMap { $0 as? URL }.filter { ["png", "jpeg", "jpg", "webp"].contains($0.pathExtension.lowercased()) }.sorted { $0.path < $1.path }
for file in files {
  autoreleasepool {
    guard let source = CGImageSourceCreateWithURL(file as CFURL, nil), let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { return }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.usesLanguageCorrection = false
    req.recognitionLanguages = ["en-US"]
    do {
      try VNImageRequestHandler(cgImage: image, options: [:]).perform([req])
      let observations: [[String: Any]] = (req.results ?? []).compactMap { obs in
        guard let text = obs.topCandidates(1).first?.string else { return nil }
        return ["text": text, "x": obs.boundingBox.minX, "y": 1-obs.boundingBox.maxY, "w": obs.boundingBox.width, "h": obs.boundingBox.height]
      }
      let result: [String: Any] = ["file": file.path, "width": image.width, "height": image.height, "lines": observations]
      let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
      print(String(data: data, encoding: .utf8)!)
      fflush(stdout)
    } catch { fputs("ERROR \(file.path): \(error)\n", stderr) }
  }
}
