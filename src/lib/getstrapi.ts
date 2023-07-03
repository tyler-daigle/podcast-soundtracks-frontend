export interface StrapiImage {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  url: string;
}
export interface PodcastDetails {
  podcastName: string;
  podcastDescription: string;
  podcastHeaderImage: StrapiImage;
  podcastDefaultThumbnail: StrapiImage;
}

type ThumbnailSizes = "thumbnail" | "small" | "medium" | "large";

const apiUrl = import.meta.env.API_URL;

export function getImageData(imageData: any, imageSize: ThumbnailSizes): StrapiImage {
  const caption = imageData.caption;
  const alternativeText = imageData.alternativeText;
  const selectedImage = imageData.formats[imageSize];
  const name = selectedImage.name;
  const url = "http://localhost:1337" + selectedImage.url;
  const height = selectedImage.height;
  const width = selectedImage.width;

  return {
    name,
    alternativeText,
    caption,
    width,
    height,
    url,
  };
}

export async function getPodcastDetails() {
  const data = await fetch(
    `${apiUrl}/podcast-details?populate=podcastHeaderImage,podcastDefaultThumbnail`
  );
  const podcastData = (await data.json()).data.attributes;

  return {
    podcastName: podcastData.podcastName,
    podcastDescription: podcastData.podcastDescription,
    podcastHeaderImage: getImageData(
      podcastData.podcastHeaderImage.data.attributes,
      "large"
    ),
    podcastDefaultThumbnail: getImageData(
      podcastData.podcastDefaultThumbnail.data.attributes,
      "thumbnail"
    ),
  } as PodcastDetails;
}

