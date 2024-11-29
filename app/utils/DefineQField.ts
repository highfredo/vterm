export const inputConfig = (state) => ({
  props: {
    error: !!state.errors[0],
    'error-message': state.errors[0]
  }
})
