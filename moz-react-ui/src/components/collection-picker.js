import React, { Component } from 'react';
import MyCollection from './my-collection'

class CollectionPicker extends Component {

  constructor(props) {
    super(props)

    this.state= {adultCollectionOK : false, adultButtonLabel: "Activer thèmes adultes"}
    if (!localStorage.getItem("adultThemesAuthorized")) localStorage.setItem('adultThemesAuthorized', false)
  }

  selectionChanged(collection) {
    this.props.onCollectionSelected(collection)
  }

  // onMyCollectionImageAdded(url_data) {
  //   alert('erg')
  //   this.props.addImageToMyCollection(url_data)
  // }

  toggleAdultSwitch() {
    const cur = this.state.adultCollectionOK
    let confirmed = !cur ? confirm("Si vous avez moins de 18 ans cliquez sur 'annuler'") : true
    if (confirmed) {
      localStorage.setItem('adultThemesAuthorized', !cur)
      this.setState({adultCollectionOK : !cur, adultButtonLabel: "Désactiver les thèmes adultes"})
    }
  }

  render() {
    //console.log('rendering collection picker')
    let collectionItems = [];
    if (this.props.collections) {
      let filteredCollections = this.props.collections.filter( c => !c.is_adult || this.state.adultCollectionOK)
      collectionItems = filteredCollections.map( (collection, i) => {
        let myColl = collection.isMyCollection ? <MyCollection addImageToMyCollection={this.props.addImageToMyCollection} collectionName={collection.name_fr}></MyCollection> : collection.name_fr + ' (' + collection.nb_images + ')';
        return <li key={i}><span>{myColl}<input type="checkbox" checked={collection.checked} onChange={() => this.selectionChanged(collection)}/></span></li>
     })
      //   let myColl = collection.isMyCollection ? <MyCollection></MyCollection> : collection.name_fr;
      //   return <li key={i}><span>{myColl}<input type="checkbox" checked={collection.checked} onChange={() => this.selectionChanged(collection)}/></span></li>
      // )
      // }
      
    }

    return (
      <div className="CollectionPicker">
        <h3 className="">Collections à utiliser</h3>
        <input type='button' className='adultSwitch' ref='aSwitch' value={this.state.adultButtonLabel} onClick={() => this.toggleAdultSwitch()} />
        <ul>{collectionItems}</ul>
      </div>
    );
  }
}

export default CollectionPicker