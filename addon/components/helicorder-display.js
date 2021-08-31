import Component from '@glimmer/component';
import { action } from '@ember/object';
import seisplotjs from 'seisplotjs';

export default class HelicorderDisplayComponent extends Component {
  graph = null;

  @action
  createGraph(element) {
    let div = seisplotjs.d3.select(element);
    div.append("p").text("createGraph");
    this.redrawHeli({
      div: div,
      seisData: this.args.helicorderData,
      amp: "none",
      timeWindow: new seisplotjs.util.StartEndDuration(this.args.start, this.args.end, this.args.duration)
    });
  }

  @action
  updateGraph(element) {
    let div = seisplotjs.d3.select(element);
    div.append("p").text("updateGraph");

    this.redrawHeli({
      channel: this.args.channel,
      div: div,
      seisData: this.args.helicorderData,
      amp: "none",
      timeWindow: new seisplotjs.util.StartEndDuration(this.args.start, this.args.end)
    });
  }

  redrawHeli(hash) {
    console.log(`heli redraw... ${hash.amp}`)
    // this global comes from the seisplotjs standalone js
    const moment = seisplotjs.moment;
    // this global comes from the seisplotjs_waveformplot standalone js
    const d3 = seisplotjs.d3;

    let svgParent = hash.div;
    svgParent.selectAll("*").remove(); // remove old data
    if (hash.seisData) {
      let heliConfig = new seisplotjs.helicorder.HelicorderConfig(hash.timeWindow);
      heliConfig.markerFlagpoleBase = 'center';
      heliConfig.lineSeisConfig.markerFlagpoleBase = 'center';
      if (hash.amp === 'max') {
        console.log(`amp max`)
        heliConfig.fixedYScale = null;
        heliConfig.maxVariation = 0;
      } else if (typeof hash.amp === 'string' && hash.amp.endsWith('%')) {
        heliConfig.fixedYScale = null;
        const precent = Number(hash.amp.substring(0, hash.amp.length-1))/100;
        heliConfig.maxVariation = precent*(hash.seisData.max-hash.seisData.mean);
          console.log(`default amp precent a=${hash.amp}  p=${precent}  mv=${heliConfig.maxVariation}`)
      } else if (Number.isFinite(hash.amp)) {
        console.log(`amp range ${hash.amp}`)
        heliConfig.fixedYScale = null;
        heliConfig.maxVariation = hash.amp;
      } else {
        console.log(`default amp max`)
        heliConfig.fixedYScale = null;
        heliConfig.maxVariation = 0;
      }
      heliConfig.doRMean = true;

      svgParent.selectAll("div").remove(); // remove old data
      svgParent.selectAll("p").remove(); // remove old data
      svgParent.selectAll("h3").remove(); // remove old data
      hash.heli = new seisplotjs.helicorder.Helicorder(svgParent,
                                    heliConfig,
                                    hash.seisData);
      hash.heli.draw();
      d3.select("span#minAmp").text(hash.seisData.min.toFixed(0));
      d3.select("span#maxAmp").text(hash.seisData.max.toFixed(0));
      d3.select("span#meanAmp").text(hash.seisData.mean.toFixed(0));
      d3.select("span#varyAmp").text(hash.amp);
    } else {
      svgParent.append("p").text("No Data.")
    }
    return hash;
  }

}
