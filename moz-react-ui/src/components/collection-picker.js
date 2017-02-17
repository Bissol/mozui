import React, { Component } from 'react';

class CollectionPicker extends Component {

  selectionChanged(collection) {
    this.props.onCollectionSelected(collection)
  }

  render() {
    
    let collectionItems = [];
    if (this.props.collections) {
      //console.log(this.props.collections)
      collectionItems = this.props.collections.map((collection, i) =>
      <li key={i}><span>{collection.name_fr}<input type="checkbox" checked={collection.checked} onChange={colletion => this.selectionChanged(collection)}/></span></li>
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