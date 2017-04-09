import {distance, merge} from './distance'

class Cluster {
  
  constructor(tiles, k) {
    this.tiles = tiles
    this.k = k
    this.seeds = new Array(k)
    this.votes = new Array(k)
    this.clusterCenters = new Array(k)
    this.tmpClusters = new Array(k)
    this.initializeRand()
  }
  
  getClusterCenters(distanceParam)
  {
    for (var nbiter=0; nbiter<10; nbiter++) {
      this.voteForClusters(distanceParam)
      this.votes.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0)
      this.votes.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
    }
    return this.clusterCenters
  }
  
  initializeRand()
  {
    for (var i=0; i<this.k; i++) {
      let ok = false
      while (!ok) {
        const ri = Math.floor(Math.random() * this.tiles.length)
        if (!this.seeds.includes(ri)) ok = true
        this.seeds[i] = ri
        this.clusterCenters[i] = JSON.parse(JSON.stringify(this.tiles[ri]))
        this.tmpClusters[i] = JSON.parse(JSON.stringify(this.tiles[ri]))
      }
    }
  }
  
  voteForClusters(distanceParam)
  {
    this.votes.fill(0)
    this.tiles.forEach( (t,ti) => {
      let cluster_i = this.assignTileToCluster(t, distanceParam)
      merge(this.tmpClusters[cluster_i], this.votes[cluster_i], t, 1, this.tmpClusters[cluster_i])
      this.votes[cluster_i]++
    })
    this.tmpClusters.forEach((cc,cci) => {
      this.clusterCenters[cci] = cc
    })
  }
  
  assignTileToCluster(t, distanceParam)
  {
    let minDist = Infinity
    let clus_i = -1
    this.clusterCenters.forEach( (clus,i) => {
      let d = distance(t, clus, distanceParam)
      if (d  < minDist) {
        minDist = d
        clus_i = i
      }
    })
    
    return clus_i
  }
}

export default Cluster;