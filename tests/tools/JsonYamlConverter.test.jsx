import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JsonYamlConverter from '../../src/tools/JsonYamlConverter.jsx';

describe('JsonYamlConverter', () => {
  describe('JSON to YAML conversion', () => {
    it('renders without crashing', () => {
      render(<JsonYamlConverter />);
      expect(screen.getByText('JSON ↔ YAML Converter')).toBeInTheDocument();
    });

    it('default content (K8s manifest) is present in input on mount', () => {
      render(<JsonYamlConverter />);

      const textarea = screen.getByLabelText(/Input \(JSON\)/i);
      expect(textarea.value).toContain('apiVersion');
      expect(textarea.value).toContain('kind');
      expect(textarea.value).toContain('metadata');
    });

    it('converts valid JSON to YAML output containing expected keys (apiVersion, kind, metadata)', () => {
      render(<JsonYamlConverter />);

      const outputSection = screen.getByText(/Output \(YAML\)/i).closest('.space-y-4');
      expect(outputSection).toHaveTextContent('apiVersion');
      expect(outputSection).toHaveTextContent('kind');
      expect(outputSection).toHaveTextContent('metadata');
    });

    it('shows error for invalid JSON input', () => {
      render(<JsonYamlConverter />);

      const textarea = screen.getByLabelText(/Input \(JSON\)/i);
      fireEvent.change(textarea, { target: { value: '{ invalid json }' } });

      expect(screen.getByText(/Expected property name/i)).toBeInTheDocument();
    });
  });

  describe('YAML to JSON conversion', () => {
    it('after toggling direction, converts YAML input to JSON', () => {
      render(<JsonYamlConverter />);

      // Toggle to YAML → JSON
      const toggleButton = screen.getByText('JSON → YAML');
      fireEvent.click(toggleButton);

      // Clear input and add YAML
      const textarea = screen.getByLabelText(/Input \(YAML\)/i);
      fireEvent.change(textarea, { target: { value: 'name: test\nvalue: 123' } });

      const outputSection = screen.getByText(/Output \(JSON\)/i).closest('.space-y-4');
      expect(outputSection).toHaveTextContent('"name"');
      expect(outputSection).toHaveTextContent('"test"');
      expect(outputSection).toHaveTextContent('"value"');
      expect(outputSection).toHaveTextContent('123');
    });

    it('shows error for invalid YAML input (e.g., tab indentation issues)', () => {
      render(<JsonYamlConverter />);

      // Toggle to YAML → JSON
      const toggleButton = screen.getByText('JSON → YAML');
      fireEvent.click(toggleButton);

      const textarea = screen.getByLabelText(/Input \(YAML\)/i);
      fireEvent.change(textarea, { target: { value: 'name:\n\tvalue: test' } });

      expect(screen.getByText(/tab characters must not be used/i)).toBeInTheDocument();
    });
  });

  describe('Direction toggle', () => {
    it('toggle button text changes between "JSON → YAML" and "YAML → JSON"', () => {
      render(<JsonYamlConverter />);

      const toggleButton = screen.getByText('JSON → YAML');
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByText('YAML → JSON')).toBeInTheDocument();
    });

    it('output pane header reflects current output format', () => {
      render(<JsonYamlConverter />);

      expect(screen.getByText(/Output \(YAML\)/i)).toBeInTheDocument();

      const toggleButton = screen.getByText('JSON → YAML');
      fireEvent.click(toggleButton);

      expect(screen.getByText(/Output \(JSON\)/i)).toBeInTheDocument();
    });
  });
});
