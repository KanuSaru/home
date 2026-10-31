// A photo taped onto the page, a little crooked. Without an image it shows
// an empty frame, so the layout is ready before the picture is.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function TapedPhoto({ src, alt, caption }: { src?: string; alt: string; caption?: string }) {
  return (
    <figure className="taped">
      <span className="tape tape-a" aria-hidden="true" />
      <span className="tape tape-b" aria-hidden="true" />
      <div className="taped-photo">
        {src ? <img src={`${BASE}/${src.replace(/^\//, "")}`} alt={alt} /> : <span className="taped-empty" aria-hidden="true" />}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
