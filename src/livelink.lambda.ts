import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import fetch from 'node-fetch';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log('INPUT', event.rawPath, event.rawQueryString);
    const stream = configure(event.rawPath);
    console.log('STREAM', stream);

    return await redirect(await resolveStream(stream));
  } catch {
    return { statusCode: 404 };
  }
};

function assert<T>(value: T | undefined | null): T {
  if (!value || value === null) {
    throw Error();
  }

  return value;
}

enum ContentType {
  DASH = 'video/vnd.mpeg.dash.mpd',
  HLS = 'application/vnd.apple.mpegurl',
}

interface Stream {
  url: string;
  contentType: ContentType;
  embed: boolean;
}

function configure(path: string): Stream {
  const match = assert(path.match(
    /^\/(channel|channel-id|video)(\/embed)?\/([^\/]*)(?=\.(m3u8|mpd))/,
  ));

  const url = (type: string, id: string): string => {
    switch (type.toLowerCase()) {
      case 'channel':
        return 'https://www.youtube.com/c/' + id + '/live';
      case 'channel-id':
        return 'https://www.youtube.com/channel/' +id + '/live';
      case 'video':
      default:
        return 'https://www.youtube.com/watch?v=' + id;
    }
  };

  return {
    url: url(assert(match[1]), assert(match[3])),
    contentType: assert(match[4]) === 'mpd' ? ContentType.DASH : ContentType.HLS,
    embed: Boolean(match[2]),
  };
}

async function resolveStream(
  stream: Stream,
): Promise<Stream> {
  const res = await fetch(stream.url);
  const body = await res.text();

  let matches;
  if (stream.contentType === ContentType.DASH) {
    matches = body.match(/(?<=dashManifestUrl":").*?(?=",")/g);
  } else {
    matches = body.match(/(?<=hlsManifestUrl":").*\.m3u8/g);
  }

  return {
    url: assert(matches?.[0]),
    contentType: stream.contentType,
    embed: stream.embed,
  };
}

async function redirect(
  stream: Stream,
): Promise<APIGatewayProxyResultV2> {
  if (stream.embed) {
    const response = await fetch(stream.url);
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': stream.contentType,
      },
      body: await response.text(),
    };
  }

  return {
    statusCode: 302,
    headers: {
      'Content-Type': stream.contentType,
      'location': stream.url,
    },
  };
}
