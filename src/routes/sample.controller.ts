import { Controller, Get, Route, Security, SuccessResponse } from 'tsoa';
@Route('sample')
export class sampleController extends Controller {
  /**
   * Says hello
   * @returns any
   */
  @Get('/sayhello')
  @Security('cookie', ['foo'])
  @SuccessResponse(200, 'Says Hello')
  public sayHello (
  ): Promise<any> {
    return Promise.resolve(JSON.stringify({ message: 'hello' }));
  }
}
