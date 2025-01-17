const openInNewTab = (url) => {
    var prefix = 'http://';
    var prefix2 = 'https://';
    let link = url;

    if(url.includes(prefix) || url.includes(prefix2)) {
        const newWindow = window.open(link, '_blank', 'noopener, noreferrer');
        if (newWindow) newWindow.opener = null;
        return;
    }
    if (url.substr(0, prefix.length) !== prefix) {
        link = prefix + url;
    }
    const newWindow = window.open(link, '_blank', 'noopener, noreferrer')
    if (newWindow) newWindow.opener = null
}

const readImage = (e) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        return Promise.all(files.map(file => {
            return (new Promise((resolve,reject) => {
                const reader = new FileReader();
                reader.addEventListener('load', (ev) => {
                    resolve(ev.target.result);
                });
                reader.addEventListener('error', reject);
                reader.readAsDataURL(file);
            }));
        }))
    }
}

const validateLink = (text) => {
  const isValid = text.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/
  );

  if (!isValid) return false;

  return true;
};

export default {
    openInNewTab,
    readImage,
    validateLink
}