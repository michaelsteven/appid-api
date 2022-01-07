import { Controller, Get, Route, Security, SuccessResponse } from 'tsoa';
@Route('sample')
export class sampleController extends Controller {
  /**
   * Says hello
   * @returns any
   */
  @SuccessResponse(200, 'Says Hello')
  @Get('/sayhello')
  @Security('jwt', ['foo'])
  public sayHello (
  ): Promise<any> {
    return Promise.resolve(JSON.stringify({ message: 'hello' }));
  }
};
