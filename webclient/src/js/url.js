export const getURLParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isRobotUser = urlParams.get('robot') === 'true';
  const localPeerId = urlParams.get('localPeerId');
  const remotePeerId = urlParams.get('remotePeerId');

  return {
    isRobotUser,
    localPeerId,
    remotePeerId,
  };
};

export const setURLParams = (newParams) => {
  const urlParams = new URLSearchParams(window.location.search);
  Object.keys(newParams).forEach((key) => {
    urlParams.set(key, newParams[key]);
  });
  window.history.replaceState(null, null, `?${urlParams.toString()}`);
};
