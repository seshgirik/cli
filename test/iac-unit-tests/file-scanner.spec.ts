const mockFs = require('mock-fs');
import * as path from 'path';
import { scanFiles } from '../../src/cli/commands/test/iac-local-execution/file-scanner';
import { IacFileParsed } from '../../src/cli/commands/test/iac-local-execution/types';

import {
  paresdKubernetesFileStub,
  parsedTerraformFileStub,
  expectedViolatedPoliciesForK8s,
  expectedViolatedPoliciesForTerraform,
} from './file-scanner.fixtures';

describe('scanFiles', () => {
  const parsedFiles: Array<IacFileParsed> = [
    paresdKubernetesFileStub,
    parsedTerraformFileStub,
  ];

  beforeAll(() => {
    mockFs({
      [path.resolve(__dirname, '../../.iac-data')]: mockFs.load(
        path.resolve(__dirname, '../smoke/.iac-data'),
      ),
    });
  });

  afterAll(mockFs.restore);

  describe('with parsed files', () => {
    it('returns the expected viloated policies', async () => {
      const scanResults = await scanFiles(parsedFiles);
      expect(scanResults[0].violatedPolicies).toEqual(
        expectedViolatedPoliciesForK8s,
      );
      expect(scanResults[1].violatedPolicies).toEqual(
        expectedViolatedPoliciesForTerraform,
      );
    });

    // TODO: Extract policy engine & the cache mechinism, test them separately.
  });

  describe('missing policy engine wasm files', () => {
    it('throws an error', async () => {
      mockFs({
        [path.resolve(__dirname, '../../.iac-data')]: {},
      });

      await expect(scanFiles(parsedFiles)).rejects.toThrow();
    });
  });
});