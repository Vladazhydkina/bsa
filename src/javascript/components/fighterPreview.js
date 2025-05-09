import createElement from '../helpers/domHelper';

export function createFighterPreview(fighter, position) {
    const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
    const fighterElement = createElement({
        tagName: 'div',
        className: `fighter-preview___root ${positionClassName}`
    });

    function createFighterPhoto(image) {
        const element = createElement({
          tagName: 'img',
          className: 'fighter-preview___image',
          attributes: {
            src: image
          }
        });
        
        if(position === 'right') {
          element.style.transform = 'scale(-1, 1)';
        }
    
        position === 'right'?  element.style.transform = 'scale(-1, 1)': null;
        return element;
    }
      
      function createFighterInfoCloumn(fighter) {
        const fighterInfoItem = createElement({
          tagName: 'span',
          className: 'fighter-preview___info-item'
        });
        fighterInfoItem.innerText = fighter;
        return fighterInfoItem;
      }
      
      
      if(fighter) {
        const fighterImage = createFighterPhoto(fighter['source']);
        const keyValueArray = Object.entries(fighter);
        fighterElement.append(fighterImage);
        keyValueArray
          .filter(e => e[0] !== '_id' && e[0] !== 'source')
          .map(el => fighterElement.append(createFighterInfoCloumn(el.join(': '))));
      }

    return fighterElement;
}

export function createFighterImage(fighter) {
    const { source, name } = fighter;
    const attributes = {
        src: source,
        title: name,
        alt: name
    };
    const imgElement = createElement({
        tagName: 'img',
        className: 'fighter-preview___img',
        attributes
    });

    return imgElement;
}
