// Render evidence images and extract searchable text from a generated PDF.
// Usage: swift scripts/pdf-render.swift input.pdf output-directory
import Foundation
import PDFKit
import AppKit

guard CommandLine.arguments.count == 3 else {
  fatalError("Usage: pdf-render.swift input.pdf output-directory")
}
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
guard let pdf = PDFDocument(url: input) else { fatalError("Unable to read PDF") }
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
var text = ""
for index in 0..<pdf.pageCount {
  guard let page = pdf.page(at: index) else { fatalError("Missing page") }
  let bounds = page.bounds(for: .mediaBox)
  let image = page.thumbnail(of: NSSize(width: bounds.width * 2, height: bounds.height * 2), for: .mediaBox)
  guard let tiff = image.tiffRepresentation,
        let bitmap = NSBitmapImageRep(data: tiff),
        let png = bitmap.representation(using: .png, properties: [:]) else { fatalError("Unable to render page") }
  try png.write(to: output.appendingPathComponent("page-\(index + 1).png"))
  text += "--- Page \(index + 1) ---\n" + (page.string ?? "") + "\n"
}
try text.write(to: output.appendingPathComponent("extracted-text.txt"), atomically: true, encoding: .utf8)
print("Rendered \(pdf.pageCount) pages and extracted their text")
