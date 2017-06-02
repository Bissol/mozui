import React, { Component } from 'react';
import MyCollection from './my-collection'

class CollectionPicker extends Component {

  selectionChanged(collection) {
    this.props.onCollectionSelected(collection)
  }

  render() {
    //console.log('rendering collection picker')
    let collectionItems = [];
    if (this.props.collections) {
      //console.log(this.props.collections)
      collectionItems = this.props.collections.map((collection, i) => {
        let myColl = collection.isMyCollection ? <MyCollection></MyCollection> : collection.name_fr
      }
      <li key={i}><span>{myColl}<input type="checkbox" checked={collection.checked} onChange={() => this.selectionChanged(collection)}/></span></li>
      )
    }

    return (
      <div className="CollectionPicker">
        <h3 className="">Collections à utiliser</h3>
        <ul>{collectionItems}</ul>
      </div>
    );
  }
}

export default CollectionPicker