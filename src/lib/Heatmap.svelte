<script lang="ts">
  import { onMount } from 'svelte'
  import bestuhlungsplan from '../assets/bestuhlungsplan_cxt25.png';
  import { TemperatureMap } from './temperatureMap'
  import { saalplanMap } from './saalplanMap'
  import InfoOverlay from './InfoOverlay.svelte'
  import { createApolloClient } from './createApolloClient'
  import { gql } from '@apollo/client'

  export let temperatures: {
    place: string,
    temperature: number,
    timestamp: Date
  }[] = []

  const client = createApolloClient();

  onMount(async () => {
    const res = await client
      .query({
        query: gql`
          query {
            currentTemperatureData {
              seat
              value
              timestamp
            }
          }
        `,
      })
    temperatures = res.data.currentTemperatureData.map((t: {seat: string, value: number, timestamp: Date}) => {
      return {
        place: t.seat,
        temperature: t.value,
        timestamp: t.timestamp
      }
    })

    const subscription = await client.subscribe({query: gql`
      subscription {
        seatDataChanged {
          seat
          value
          timestamp
        }
      }
    `})

    subscription.subscribe((update) => {
      const updatedData = update.data.seatDataChanged
      const index = temperatures.findIndex((t) => t.place === updatedData.seat)
      temperatures[index] = {
        place: updatedData.seat,
        temperature: updatedData.value,
        timestamp: updatedData.timestamp
      }
    })

  })

  $: temperaturePoints = temperatures.map(({ place, temperature, timestamp }) => {
    const seatLocation = saalplanMap[place as keyof typeof saalplanMap]
    return {
      x: seatLocation.x * w / IMAGE_WIDTH,
      y: seatLocation.y * h / IMAGE_HEIGHT,
      place,
      timestamp,
      value: temperature,
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
  let temperatureMap: TemperatureMap;

  const img = new Image()
  img.src = bestuhlungsplan

  onMount(() => {
		context = canvas.getContext('2d')
    if (context) {
		  context.lineWidth = 3
      temperatureMap = new TemperatureMap(context)
    }
		
		handleSize()
	})
    

  $: draw = () => {
    if (temperatureMap) {
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
</script>

<svelte:window on:resize={handleSize} />

<div class="canvas-wrapper" bind:this={canvasWrapper}>
  <canvas bind:this={canvas} />
  <InfoOverlay temperatures={temperaturePoints}></InfoOverlay>
</div>


<style>
  
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