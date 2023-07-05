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
  podcastHeaderImageLarge: StrapiImage;
  podcastHeaderImageMedium: StrapiImage;
  podcastDefaultThumbnail: StrapiImage;
}

export interface PodcastHost {
  hostName: string;
  hostBio: string;
  hostPicture: StrapiImage | null;
}

export interface PodcastEpisode {
  episodeName: string;
  episodeDescription: string;
  episodeNumber: number;
  episodeDownloadLinks: string[];
  episodeThumbnail: StrapiImage;
  episodeReleaseDate: Date;
}

export type PodcastSocialLinks = Map<string, string>;

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

export async function getPodcastHosts(): Promise<PodcastHost[]> {
  const data = await fetch(`${apiUrl}/podcast-hosts?populate=hostPicture`);
  const json = await data.json();
  const hostData = json.data;

  const hosts: PodcastHost[] = hostData.map((podcastHost: any) => {
    const { attributes } = podcastHost;
    return {
      hostName: attributes.hostName,
      hostBio: attributes.hostBio,
      hostPicture: attributes.hostPicture.data !== null ? getImageData(attributes.hostPicture.data, "thumbnail") : null
    }
  });
  return hosts;
}

export async function getPodcastDetails() {
  const data = await fetch(
    `${apiUrl}/podcast-details?populate=podcastHeaderImage,podcastDefaultThumbnail`
  );
  const podcastData = (await data.json()).data.attributes;

  return {
    podcastName: podcastData.podcastName,
    podcastDescription: podcastData.podcastDescription,
    podcastHeaderImageLarge: getImageData(
      podcastData.podcastHeaderImage.data.attributes,
      "medium" // TODO: some images don't have large verisons
    ),
    podcastHeaderImageMedium: getImageData(
      podcastData.podcastHeaderImage.data.attributes,
      "medium"
    ),
    podcastDefaultThumbnail: getImageData(
      podcastData.podcastDefaultThumbnail.data.attributes,
      "thumbnail"
    ),
  } as PodcastDetails;
}

export async function getEpisodeList(): Promise<PodcastEpisode[]> {
  // episodes?populate=episodeThumbnail
  const data = await fetch(`${apiUrl}/episodes?populate=episodeThumbnail`);
  const json = await data.json();
  const episodeData = json.data;
  const episodeList: PodcastEpisode[] = episodeData.map((episode: any) => {
    // can add id if needed.
    const { attributes } = episode;
    return {
      episodeName: attributes.episodeName,
      episodeDescription: attributes.episodeDescription,
      episodeDownloadLinks: attributes.episodeDownloadLinks,
      episodeThubmnail: getImageData(attributes.episodeThumbnail.data.attributes, "thumbnail"),
      episodeReleaseDate: new Date(attributes.episodeReleaseDate + ":12:00")
    };
  });

  return episodeList;
}

export async function getSocialLinks(): Promise<PodcastSocialLinks> {
  const data = await fetch(`${apiUrl}/social-media`);
  const json = await data.json();
  const socialLinks = json.data.attributes as PodcastSocialLinks;
  const allowedSites = ["instagram", "twitter", "patreon", "facebook", "www"];
  const links: PodcastSocialLinks = new Map();

  console.log(socialLinks);

  Object.keys(socialLinks).forEach(link => {
    if (allowedSites.includes(link)) {
      links.set(link, socialLinks[link]);
    }
  })

  console.log(links);

  return links;
}