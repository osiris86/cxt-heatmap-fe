<script lang="ts">
  import Tooltip, {
    Wrapper,
    Title,
    Content,
  } from '@smui/tooltip';
  import moment from 'moment/min/moment-with-locales';
  moment.locale('de');

  export let temperatures: {
    x: number,
    y: number,
    place: string,
    value: number,
    timestamp: Date
  }[]

  $: temperaturePoints = temperatures.map(({ x, y, place, value, timestamp }) => {
    return {
      x,
      y,
      place,
      value,
      timestamp,
      ago: moment(timestamp).fromNow()
    }
  })

  const updateAgo = (index: number) => {
    const ago = moment(temperaturePoints[index].timestamp).fromNow()
    temperaturePoints[index].ago = ago;
    temperaturePoints = temperaturePoints;
  }
</script>

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

<style>
  .info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>