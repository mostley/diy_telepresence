const accessToken = '8f9225083720dec1fb3f1c50a5a9436049443a99';
const bitlyUrl = 'https://api-ssl.bitly.com/v4/shorten';

export const generateShortLink = (url) => {
  return fetch(bitlyUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      long_url: url,
    }),
  })
    .then((response) => response.json())
    .then((data) => data.link);
}
