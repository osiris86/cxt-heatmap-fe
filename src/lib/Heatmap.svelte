<script lang="ts">
  import { onMount } from 'svelte'
  import bestuhlungsplan from '../assets/bestuhlungsplan_cxt25.png';
  import { TemperatureMap } from './temperatureMap'
  import { saalplanMap } from './saalplanMap'
  import Tooltip, {
    Wrapper,
    Title,
    Content,
  } from '@smui/tooltip';
  import moment from 'moment/min/moment-with-locales';
  moment.locale('de');

  export let temperatures: {
    place: string,
    temperature: number,
    timestamp: Date
  }[]

  $: temperaturePoints = temperatures.map(({ place, temperature, timestamp }) => {
    const seatLocation = saalplanMap[place as keyof typeof saalplanMap]
    return {
      x: seatLocation.x * w / IMAGE_WIDTH,
      y: seatLocation.y * h / IMAGE_HEIGHT,
      place,
      timestamp,
      value: temperature,
      ago: moment(timestamp).fromNow()
    }
  })
  $: {
		console.log('drawing temperatures ' + temperaturePoints);
    draw();
	}

  const IMAGE_WIDTH = 1903
  const IMAGE_HEIGHT = 1124

  let canvasWrapper: HTMLDivElement;
  let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null;
  let w: number;
  let h: number;

  onMount(() => {
		context = canvas.getContext('2d')
    if (context) {
		  context.lineWidth = 3
    }
		
		handleSize()
	})

  $: draw = () => {
    if (!context) return;

    const img = new Image()
    const temperatureMap = new TemperatureMap(context)
    img.onload = () => {
      temperatureMap.setPoints(temperaturePoints, w, h);
      temperatureMap.drawFull(false, () => {
        temperatureMap.drawPoints(async () => {
          const img2 = new Image();
          img2.onload = () => {
            if (!context) return;
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
            context.drawImage(img2, 0, 0, w, h);
          };
          img2.src = canvas.toDataURL();
        });
      });
    }
    img.src = bestuhlungsplan
  }

  const handleSize = () => {
		const { width } = canvas.getBoundingClientRect()
		w = width
		h = width / IMAGE_WIDTH * IMAGE_HEIGHT
    canvas.width = w
    canvas.height = h
    canvasWrapper.style.height = h + 'px'
    draw()
	}

  const updateAgo = (index: number) => {
    const ago = moment(temperaturePoints[index].timestamp).fromNow()
    console.log('new value: ' + ago)
    temperaturePoints[index].ago = ago;
    temperaturePoints = temperaturePoints;
  }
</script>

<svelte:window on:resize={handleSize} />

<div class="canvas-wrapper" bind:this={canvasWrapper}>
  <canvas bind:this={canvas} />
  <div class="info-overlay">
    {#if temperaturePoints}
      {#each temperaturePoints as temp, index}
        <Wrapper rich>
          <div role="button" tabindex={index} style={ "position: absolute; width: 16px; height: 16px; left: " + (temp.x-8) + "px; top: " + (temp.y-8) + "px"} on:mouseover={(event) => updateAgo(index)} on:focus={undefined}>
          </div>
          <Tooltip>
            <Title>{temp.place}</Title>
            <Content>
              Gemessene Temperatur: <strong>{temp.value}°C</strong><br/>
              gemessen {temp.ago}
            </Content>
          </Tooltip>
        </Wrapper>
	    {/each}
    {/if}
  </div>
</div>


<style>
  .info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .canvas-wrapper {
    position: relative;
    width: 100%;
  }
  canvas {
    width: 100%;
    height: 100%;
    background: white;
  }
</style>